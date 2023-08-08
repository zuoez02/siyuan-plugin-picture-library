const i18n = {};

export const _ = (m) => i18n[m];

export const setI18n = (v) => Object.assign(i18n, v);
