dev:
	docker compose up -d --force-recreate blog_test_postgres blog_test_redis
	timeout 30
	yarn migrate
	yarn dev
