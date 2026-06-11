/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Progress_Expiresin24h2Inputs */

const en_auth_checkemail_progress_expiresin24h2 = /** @type {(inputs: Auth_Checkemail_Progress_Expiresin24h2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link expires in 24 hours`)
};

const cs_auth_checkemail_progress_expiresin24h2 = /** @type {(inputs: Auth_Checkemail_Progress_Expiresin24h2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Odkaz vyprší za 24 hodin`)
};

/**
* | output |
* | --- |
* | "Link expires in 24 hours" |
*
* @param {Auth_Checkemail_Progress_Expiresin24h2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_progress_expiresin24h2 = /** @type {((inputs?: Auth_Checkemail_Progress_Expiresin24h2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Progress_Expiresin24h2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_progress_expiresin24h2(inputs)
	return cs_auth_checkemail_progress_expiresin24h2(inputs)
});
export { auth_checkemail_progress_expiresin24h2 as "auth.checkEmail.progress.expiresIn24h" }