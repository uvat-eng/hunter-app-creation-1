import json
import os
import base64
import uuid
import psycopg2
import boto3

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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


def serialize(d):
    out = {}
    for k, v in d.items():
        out[k] = v.isoformat() if hasattr(v, 'isoformat') else v
    return out


def upload_photo(data_url: str) -> str:
    if not data_url or not data_url.startswith('data:'):
        return data_url or ''
    header, encoded = data_url.split(',', 1)
    content_type = header.split(':')[1].split(';')[0]
    ext = content_type.split('/')[-1] or 'jpg'
    data = base64.b64decode(encoded)
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    key = f"hunters/{uuid.uuid4()}.{ext}"
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def handler(event: dict, context) -> dict:
    """Анкета охотника: создание, получение и обновление личного профиля (фото хранится в S3)"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = get_conn()
    conn.autocommit = True
    cur = conn.cursor()

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        hunter_id = params.get('id')
        if not hunter_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        q(cur, 'SELECT * FROM hunters WHERE id = %s', (hunter_id,))
        row = cur.fetchone()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(serialize(row_to_dict(cur, row)), ensure_ascii=False)}

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        photo_url = upload_photo(body.get('photo', ''))
        q(cur, """
            INSERT INTO hunters (name, city, ticket, ticket_date, photo, experience, weapon, game)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            body.get('name', ''),
            body.get('city', ''),
            body.get('ticket', ''),
            body.get('ticketDate') or None,
            photo_url,
            body.get('experience', ''),
            body.get('weapon', ''),
            body.get('game', ''),
        ))
        row = cur.fetchone()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(serialize(row_to_dict(cur, row)), ensure_ascii=False)}

    if method == 'PUT':
        hunter_id = body.get('id')
        if not hunter_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        photo_url = upload_photo(body.get('photo', ''))
        q(cur, """
            UPDATE hunters SET
                name = %s, city = %s, ticket = %s, ticket_date = %s,
                photo = %s, experience = %s, weapon = %s, game = %s,
                updated_at = now()
            WHERE id = %s
            RETURNING *
        """, (
            body.get('name', ''),
            body.get('city', ''),
            body.get('ticket', ''),
            body.get('ticketDate') or None,
            photo_url,
            body.get('experience', ''),
            body.get('weapon', ''),
            body.get('game', ''),
            hunter_id,
        ))
        row = cur.fetchone()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(serialize(row_to_dict(cur, row)), ensure_ascii=False)}

    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}