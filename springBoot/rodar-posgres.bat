@echo off
REM Abre o PostgreSQL no container Docker "container_pateando"

echo Acessando PostgreSQL dentro do container Docker...
docker exec -it container_pateando psql -U postgres

pause