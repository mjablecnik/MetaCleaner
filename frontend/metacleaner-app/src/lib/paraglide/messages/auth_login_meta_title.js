/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Meta_TitleInputs */

const en_auth_login_meta_title = /** @type {(inputs: Auth_Login_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign In – MetaCleaner`)
};

const cs_auth_login_meta_title = /** @type {(inputs: Auth_Login_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přihlásit se – MetaCleaner`)
};

/**
* | output |
* | --- |
* | "Sign In – MetaCleaner" |
*
* @param {Auth_Login_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_meta_title = /** @type {((inputs?: Auth_Login_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_meta_title(inputs)
	return cs_auth_login_meta_title(inputs)
});
export { auth_login_meta_title as "auth.login.meta.title" }