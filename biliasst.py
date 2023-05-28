import sys, rich, requests, json, hmac, hashlib, time

class U8:

    U8_APPKEY = '91240f70c09a08a6bc72af1a5c8d4670'

    @staticmethod
    def generate_hmac_sign(body: dict) -> str:
        if 'sign' in body:
            body.pop('sign')
        keys = list(body.keys())
        keys.sort()
        sb = list()
        for key in keys:
            if body[key] != None:
                sb.append(key + '=' + str(body[key]))
        return hmac.new(U8.U8_APPKEY.encode(), '&'.join(sb).encode(), hashlib.sha1).hexdigest()

    @staticmethod
    def get_body(uid: str, access_token: str) -> str:
        body = {
            "appId": "1",
            "channelId": "2",
            "deviceId": "267f2ac35b930bfb07e75d0b0900856c",
            "deviceId2": "868364050117457",
            "deviceId3": "",
            "extension": json.dumps({"uid": uid, "access_token": access_token, "isSuc": True}),
            "platform": 1,
            "subChannel": "2",
            "worldId": "2"
        }
        body['sign'] = U8.generate_hmac_sign(body)
        return json.dumps(body)

class BiliServer:

    BiliGame_id = 2
    BiliServer_id = 2
    BiliMerchant_d = 2
    BiliSecret_key = 'wgfykwenagycuf92zzuragjm7mxhvytt'

    def generate_sign(body: dict) -> str:
        if 'sign' in body:
            body.pop('sign')
        keys = list(body.keys())
        keys.sort()
        sb = str()
        for key in keys:
            sb += str(body[key])
        sb += BiliServer.BiliSecret_key
        return hashlib.md5(sb.encode()).hexdigest()

    def get_body(uid: str, access_token: str) -> str:
        body = {
            'uid': uid,
            'access_key': access_token,
            'game_id': BiliServer.BiliGame_id,
            'merchant_id': BiliServer.BiliMerchant_d,
            'server_id': BiliServer.BiliServer_id,
            'version': 1,
            'timestamp': int(time.time())
        }
        body['sign'] = BiliServer.generate_sign(body)
        return BiliServer.urlencode(body)

    def urlencode(body: dict) -> str:
        sb = list()
        for key in body:
            sb.append(key + '=' + str(body[key]))
        return '&'.join(sb)

class Url:

    AGE_RANGE = 'http://pnew.biligame.net/api/server/user/age/range'
    SESSION_VERIFY_PNEW = 'http://pnew.biligame.net/api/server/session.verify'
    SESSION_VERIFY_QCLOUD_LINE1 = 'http://line1-qcloud-game-api-adapter-na.biligame.net/api/server/session.verify'
    SESSION_VERIFY_QCLOUD_LINE2 = 'http://line2-qcloud-game-api-adapter-na.biligame.net/api/server/session.verify'
    SESSION_VERIFY_QCLOUD_LINE3 = 'http://line3-qcloud-game-api-adapter-na.biligame.net/api/server/session.verify'
    SESSION_VERIFY_LINE1 = 'http://line1-game-api-adapter-na-sh.biligame.net/api/server/session.verify'
    SESSION_VERIFY_LINE3 = 'http://line3-game-api-adapter-na-sh.biligame.net/api/server/session.verify'
    BILI_SERVER_HEADERS = {'User-Agent': 'Mozilla/5.0 GameServer', 'Content-Type': 'application/x-www-form-urlencoded'}

if __name__ == "__main__":
    logger = rich.get_console()
    if len(sys.argv) < 2:
        logger.print('Usage: [yellow]~.py[/yellow] [blue][Uid] [Access Key][/blue]')
        exit(1)
    uid = sys.argv[1]
    Access_key = sys.argv[2]
    logger.print(f'[bold green]初始化参数[/bold green] [yellow]Uid:[/yellow] [bold aquamarine1]{uid}[/bold aquamarine1] [yellow]Access Key:[/yellow] [bold aquamarine1]{Access_key}[/bold aquamarine1]')

    def server_info():
        logger.print('[bold green]测试BiliGame服务器返回[/bold green]')
        for url in [
            Url.AGE_RANGE,
            Url.SESSION_VERIFY_PNEW,
            Url.SESSION_VERIFY_QCLOUD_LINE1,
            Url.SESSION_VERIFY_QCLOUD_LINE2,
            Url.SESSION_VERIFY_QCLOUD_LINE3,
            Url.SESSION_VERIFY_LINE1,
            Url.SESSION_VERIFY_LINE3,
            ]:
            logger.log(f'[yellow]Posting[/yellow] {url}')
            data = BiliServer.get_body(uid, Access_key).encode()
            res = requests.post(url, data=data, headers=Url.BILI_SERVER_HEADERS)
            logger.log(f'[yellow]Res:[/yellow] {res.text}')

    server_info()

    logger.print('[bold green]进入GetToken循环，间隔5s[/bold green]')

    data = U8.get_body(uid, Access_key).encode()
    try:
        while True:
            res = requests.post('https://as.hypergryph.com/u8/user/v1/getToken', data=data)
            logger.log(f'[yellow]Res:[/yellow] {res.text}')
            dic = json.loads(res.text)
            if 'result' in dic:
                logger.print(f"[bold turquoise2]GetToken成功，循环结束[/bold turquoise2]")
                server_info()
                exit(0)
            time.sleep(5)
    except KeyboardInterrupt:
        exit(0)