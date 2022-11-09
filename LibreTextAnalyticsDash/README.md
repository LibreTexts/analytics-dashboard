# LibreText Analytics Dashboard

Analyzes LibreText and ADAPT data and displays it in tables and charts.

### Project Structure:
```
/src has the frontend React js files to display the dashboard
/api has the backend express node js server, which makes calls to the database and sends it to the frontend
```
## Steps to get the project running locally:
1. Clone the repository
3. ```Yarn install``` in the main part of the project
2. cd into /api, ```npm install```
3. Get the environment variables from an admin
4. To run and test on localhost in development:
   - cd /api -> ```npm run dev```
   - cd to main part of project -> ```yarn start```

### Test and Production Server Structure
The project for the LibreTexts test server should have the following structure:
```
analytics_dashboard
  /LibreTextAnalyticsDash
    /src
    /build
    /api
```
The test server structure should look something like this:
```
/home
  /{user}
    /staging
      /analytics_dashboard
  /analytics
    /src
    /api
    /build
    ...
```
The production server structure should look something like this:
```
/home
  /analytics
    /analytics_dashboard
  /var
    /www
      /analytics
        /src
        /api
        /build
        ...
```
## Steps to get the project running on the test server:
1. In the main part of the project, ```npm run build```
2. Push to github
3. ssh into the LibreText server
4. cd into project
5. ```git pull```
6. ```cd /LibreTextAnalyticsDash/```
7. Test server: ```cp -a . /home/analytics/``` Production server: ```cp -a . /var/www/analytics/```
8. Test server: ```cd /home/analytics/``` Production server: ```cd /var/www/analytics/```
9. cd into project, ```yarn install```
10. cd into /api, ```npm install```
11. Create an ecosystem.config.js file with the environment variables stored in the env_production attribute
12. ```pm2 start ecosystem.config.js --env production```

## Steps to change the code from working on the test server to the production server:
1. Change "homepage" in the src/package.json file from "https://test.libretexts.org/analytics/" to “https://analytics.libretexts.org/”
2. Change "state.homepage" in src/App.js from "/analytics/api" to "/api"
3. Change HOMEPAGE variable in api/app.js from "https://test.libretexts.org/analytics/api/" to “https://analytics.libretexts.org/api/”
4. Change REDIRECT_URL variable in api/app.js from "/analytics/api/init" to "/api/init"
5. Change DASHBOARD_URL variable in api/app.js from "/analytics" to "/"
