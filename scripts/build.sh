#!/usr/bin/env sh
tsc && \
cp -rT ./certs ./build/certs && \
cp -rT ./_api-docs ./build/_api-docs && \
cp -rT ./src/config/dpm/i18n/locales ./build/src/config/dpm/i18n/locales && \
cp -rT ./src/interface/controllers/dpm/KPI003/sql ./build/src/interface/controllers/dpm/KPI003/sql;
