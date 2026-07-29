import json
import os
import base64
import boto3

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}


def handler(event: dict, context) -> dict:
    '''Временная функция для загрузки готовой иконки приложения в S3 и получения CDN-ссылки'''
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    b64data = body.get('data', '')
    key = body.get('key', 'app-icon-rustore.png')

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    data = base64.b64decode(b64data)
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType='image/png')
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'url': cdn_url}),
    }
