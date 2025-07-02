https://web-754763122215.asia-northeast1.run.app/

ローカル起動方法

1. .gcp/service-account.jsonにサービスアカウントのJSONを貼り付ける

2. docker composeで起動

```
docker compose build

docker compose up
```

---

## githooksの初回設定

```sh
chmod +x .githooks/pre-commit .githooks/pre-push
git config core.hooksPath .githooks
```

---
