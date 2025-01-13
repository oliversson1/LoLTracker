Inštalácia aplikácie
Tento návod predpokladá, že máte spojazdnené Node.js, MySQL, Prisma, React, Vite a Express.js.

1. Stiahnutie projektu
git clone https://github.com/oliversson1/LoLTracker.git

2. Inštalácia backendu
- Prejdite do priečinka backend a spustite npm install:
    cd backend
    npm install
3. Konfigurácia databázy
- Vytvorte .env súbor a do neho nakopírujte tento obsah:
DATABASE_URL="mysql://root:heslo@localhost:3306/riot_db"
JWT_SECRET="tajnykodJWT"
REFRESH_SECRET="tajnyrefresh"
RIOT_API_KEY="" - tuto zadajte vygenerovany riot api key z ich stránky

4. Migrácia databázy a naplnenie dát
- V projekte je využitá prisma, zadajte:
npx prisma migrate dev --name init
a následne spustite node .\server.js

Teraz by mal backend bežať na http://localhost:5000

5. Ak ste spravne zadali RIOT_API_KEY v .env súbore, tak môžete spustiť aj node .\API-server.js

Server pre externý riot api beží na http://localhost:8080

6. Inštalácia frontendu
- Najprv vstúpte do frontend directory:
cd react-vite
cd react-semestralka
a následne zadajte npm install

7. Teraz môžete spustiť aj frontend pomocou príkazu
    npm run dev

8. Ak vám píše, že chýbajú nejaké npm balíčky pre beh programu, nainštalujete ich spôsobom:
    npm install <názov balíčku>

9. Po týchto krokoch by mal program úspešne fungovať