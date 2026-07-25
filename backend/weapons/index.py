import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def q(cur, sql, params=None):
    if params:
        cur.execute(cur.mogrify(sql, params))
    else:
        cur.execute(sql)


def row_to_dict(cur, row):
    cols = [d[0] for d in cur.description]
    return dict(zip(cols, row))


def to_client(d):
    return {
        'id': d['id'],
        'hunterId': d['hunter_id'],
        'name': d['name'],
        'caliber': d['caliber'],
        'permit': d['permit'],
        'permitDate': d['permit_date'].isoformat() if d.get('permit_date') else '',
        'optics': {'name': d['optics_name'], 'params': d['optics_params']} if d.get('optics_name') else None,
        'thermal': {'name': d['thermal_name'], 'params': d['thermal_params']} if d.get('thermal_name') else None,
        'collimator': {'name': d['collimator_name'], 'params': d['collimator_params']} if d.get('collimator_name') else None,
    }


def acc(body, key):
    v = body.get(key)
    if not v or not v.get('name'):
        return (None, None)
    return (v.get('name', ''), v.get('params', ''))


def handler(event: dict, context) -> dict:
    """Оружейный сейф охотника: список, добавление, редактирование и удаление единиц оружия с оптикой/тепловизором/коллиматором"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = get_conn()
    conn.autocommit = True
    cur = conn.cursor()

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        hunter_id = params.get('hunterId')
        if not hunter_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'hunterId required'})}
        q(cur, 'SELECT * FROM weapons WHERE hunter_id = %s ORDER BY created_at DESC', (hunter_id,))
        rows = cur.fetchall()
        items = [to_client(row_to_dict(cur, r)) for r in rows]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(items, ensure_ascii=False)}

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        hunter_id = body.get('hunterId')
        if not hunter_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'hunterId required'})}
        optics_name, optics_params = acc(body, 'optics')
        thermal_name, thermal_params = acc(body, 'thermal')
        coll_name, coll_params = acc(body, 'collimator')
        q(cur, """
            INSERT INTO weapons (
                hunter_id, name, caliber, permit, permit_date,
                optics_name, optics_params, thermal_name, thermal_params,
                collimator_name, collimator_params
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            hunter_id,
            body.get('name', ''),
            body.get('caliber', ''),
            body.get('permit', ''),
            body.get('permitDate') or None,
            optics_name, optics_params,
            thermal_name, thermal_params,
            coll_name, coll_params,
        ))
        row = cur.fetchone()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(to_client(row_to_dict(cur, row)), ensure_ascii=False)}

    if method == 'PUT':
        weapon_id = body.get('id')
        if not weapon_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        optics_name, optics_params = acc(body, 'optics')
        thermal_name, thermal_params = acc(body, 'thermal')
        coll_name, coll_params = acc(body, 'collimator')
        q(cur, """
            UPDATE weapons SET
                name = %s, caliber = %s, permit = %s, permit_date = %s,
                optics_name = %s, optics_params = %s,
                thermal_name = %s, thermal_params = %s,
                collimator_name = %s, collimator_params = %s,
                updated_at = now()
            WHERE id = %s
            RETURNING *
        """, (
            body.get('name', ''),
            body.get('caliber', ''),
            body.get('permit', ''),
            body.get('permitDate') or None,
            optics_name, optics_params,
            thermal_name, thermal_params,
            coll_name, coll_params,
            weapon_id,
        ))
        row = cur.fetchone()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(to_client(row_to_dict(cur, row)), ensure_ascii=False)}

    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        weapon_id = params.get('id')
        if not weapon_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        q(cur, 'DELETE FROM weapons WHERE id = %s', (weapon_id,))
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}