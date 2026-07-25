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
        'title': d['title'],
        'huntType': d['hunt_type'],
        'date': d['event_date'].isoformat() if d.get('event_date') else '',
        'status': d['status'],
        'locationName': d['location_name'] or '',
        'lat': float(d['lat']) if d.get('lat') is not None else None,
        'lng': float(d['lng']) if d.get('lng') is not None else None,
        'region': d.get('region') or '',
        'notes': d['notes'] or '',
        'reminder': d['reminder'],
        'trophies': d['trophies'] if d.get('trophies') else [],
        'photos': d['photos'] if d.get('photos') else [],
        'videos': d['videos'] if d.get('videos') else [],
        'budget': float(d['budget']) if d.get('budget') is not None else None,
    }


def upload_photo(data_url: str, s3) -> str:
    if not data_url or not data_url.startswith('data:'):
        return data_url or ''
    header, encoded = data_url.split(',', 1)
    content_type = header.split(':')[1].split(';')[0]
    ext = content_type.split('/')[-1] or 'jpg'
    data = base64.b64decode(encoded)
    key = f"hunt-events/{uuid.uuid4()}.{ext}"
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def process_photos(photos):
    if not photos:
        return []
    s3 = get_s3()
    result = []
    for p in photos[:5]:
        result.append(upload_photo(p, s3))
    return result


def upload_video(data_url: str, s3) -> str:
    if not data_url or not data_url.startswith('data:'):
        return data_url or ''
    header, encoded = data_url.split(',', 1)
    content_type = header.split(':')[1].split(';')[0]
    ext = content_type.split('/')[-1] or 'mp4'
    data = base64.b64decode(encoded)
    key = f"hunt-events/video-{uuid.uuid4()}.{ext}"
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def process_videos(videos):
    if not videos:
        return []
    s3 = get_s3()
    result = []
    for v in videos[:5]:
        result.append(upload_video(v, s3))
    return result


def handler(event: dict, context) -> dict:
    """Личный календарь выездов охотника: план/факт охоты, вид охоты, трофеи, точка на карте и до 5 фото (S3)"""
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
        q(cur, 'SELECT * FROM hunt_events WHERE hunter_id = %s ORDER BY event_date DESC', (hunter_id,))
        rows = cur.fetchall()
        items = [to_client(row_to_dict(cur, r)) for r in rows]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(items, ensure_ascii=False)}

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        hunter_id = body.get('hunterId')
        event_date = body.get('date')
        if not hunter_id or not event_date:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'hunterId and date required'})}
        photos = process_photos(body.get('photos') or [])
        videos = process_videos(body.get('videos') or [])
        q(cur, """
            INSERT INTO hunt_events (
                hunter_id, title, hunt_type, event_date, status,
                location_name, lat, lng, region, notes, reminder, trophies, photos, videos, budget
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            hunter_id,
            body.get('title', ''),
            body.get('huntType', ''),
            event_date,
            body.get('status', 'planned'),
            body.get('locationName', ''),
            body.get('lat'),
            body.get('lng'),
            body.get('region', ''),
            body.get('notes', ''),
            bool(body.get('reminder', False)),
            json.dumps(body.get('trophies') or []),
            json.dumps(photos),
            json.dumps(videos),
            body.get('budget'),
        ))
        row = cur.fetchone()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(to_client(row_to_dict(cur, row)), ensure_ascii=False)}

    if method == 'PUT':
        event_id = body.get('id')
        if not event_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        photos = process_photos(body.get('photos') or [])
        videos = process_videos(body.get('videos') or [])
        q(cur, """
            UPDATE hunt_events SET
                title = %s, hunt_type = %s, event_date = %s, status = %s,
                location_name = %s, lat = %s, lng = %s, region = %s, notes = %s,
                reminder = %s, trophies = %s, photos = %s, videos = %s, budget = %s, updated_at = now()
            WHERE id = %s
            RETURNING *
        """, (
            body.get('title', ''),
            body.get('huntType', ''),
            body.get('date'),
            body.get('status', 'planned'),
            body.get('locationName', ''),
            body.get('lat'),
            body.get('lng'),
            body.get('region', ''),
            body.get('notes', ''),
            bool(body.get('reminder', False)),
            json.dumps(body.get('trophies') or []),
            json.dumps(photos),
            json.dumps(videos),
            body.get('budget'),
            event_id,
        ))
        row = cur.fetchone()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(to_client(row_to_dict(cur, row)), ensure_ascii=False)}

    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        event_id = params.get('id')
        if not event_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        q(cur, 'DELETE FROM hunt_events WHERE id = %s', (event_id,))
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}