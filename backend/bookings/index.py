import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        'date': d['booking_date'].isoformat() if d.get('booking_date') else '',
        'services': json.loads(d['services']) if d.get('services') else [],
        'total': d['total'],
    }


def handler(event: dict, context) -> dict:
    """Онлайн-бронирование: список броней охотника и создание новой брони с выбранными услугами"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = get_conn()
    conn.autocommit = True
    cur = conn.cursor()

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        hunter_id = params.get('hunterId')
        if hunter_id:
            q(cur, 'SELECT * FROM bookings WHERE hunter_id = %s ORDER BY booking_date', (hunter_id,))
        else:
            q(cur, 'SELECT * FROM bookings ORDER BY booking_date')
        rows = cur.fetchall()
        items = [to_client(row_to_dict(cur, r)) for r in rows]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(items, ensure_ascii=False)}

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        booking_date = body.get('date')
        if not booking_date:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'date required'})}
        q(cur, """
            INSERT INTO bookings (hunter_id, booking_date, services, total)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """, (
            body.get('hunterId') or None,
            booking_date,
            json.dumps(body.get('services', [])),
            body.get('total', 0),
        ))
        row = cur.fetchone()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(to_client(row_to_dict(cur, row)), ensure_ascii=False)}

    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}