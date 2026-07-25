import json
import os
import base64
import uuid
import psycopg2
import boto3

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}

CERT_VALID_YEARS = 5


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
    issue_date = d.get('issue_date')
    expires = None
    if issue_date:
        expires = issue_date.replace(year=issue_date.year + CERT_VALID_YEARS).isoformat()
    return {
        'id': d['id'],
        'hunterId': d['hunter_id'],
        'number': d['number'] or '',
        'issueDate': issue_date.isoformat() if issue_date else '',
        'expiresDate': expires or '',
        'photo': d['photo'] or '',
    }


def upload_photo(data_url: str, s3) -> str:
    if not data_url or not data_url.startswith('data:'):
        return data_url or ''
    header, encoded = data_url.split(',', 1)
    content_type = header.split(':')[1].split(';')[0]
    ext = content_type.split('/')[-1] or 'jpg'
    data = base64.b64decode(encoded)
    key = f"medical-certificates/{uuid.uuid4()}.{ext}"
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def process_photo(photo):
    if not photo:
        return ''
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    return upload_photo(photo, s3)


def handler(event: dict, context) -> dict:
    """Медицинская справка охотника (форма 003-О/у): номер, дата выдачи (действует 5 лет), фото справки"""
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
        q(cur, 'SELECT * FROM medical_certificates WHERE hunter_id = %s ORDER BY created_at DESC LIMIT 1', (hunter_id,))
        row = cur.fetchone()
        if not row:
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(None)}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(to_client(row_to_dict(cur, row)), ensure_ascii=False)}

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        hunter_id = body.get('hunterId')
        if not hunter_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'hunterId required'})}
        photo = process_photo(body.get('photo', ''))
        q(cur, """
            INSERT INTO medical_certificates (hunter_id, number, issue_date, photo)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """, (
            hunter_id,
            body.get('number', ''),
            body.get('issueDate') or None,
            photo,
        ))
        row = cur.fetchone()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(to_client(row_to_dict(cur, row)), ensure_ascii=False)}

    if method == 'PUT':
        cert_id = body.get('id')
        if not cert_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        photo = process_photo(body.get('photo', ''))
        q(cur, """
            UPDATE medical_certificates SET
                number = %s, issue_date = %s, photo = %s, updated_at = now()
            WHERE id = %s
            RETURNING *
        """, (
            body.get('number', ''),
            body.get('issueDate') or None,
            photo,
            cert_id,
        ))
        row = cur.fetchone()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(to_client(row_to_dict(cur, row)), ensure_ascii=False)}

    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        cert_id = params.get('id')
        if not cert_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        q(cur, 'DELETE FROM medical_certificates WHERE id = %s', (cert_id,))
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}
