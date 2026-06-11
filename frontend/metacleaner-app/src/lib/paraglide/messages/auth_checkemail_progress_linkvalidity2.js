/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Progress_Linkvalidity2Inputs */

const en_auth_checkemail_progress_linkvalidity2 = /** @type {(inputs: Auth_Checkemail_Progress_Linkvalidity2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link validity`)
};

const cs_auth_checkemail_progress_linkvalidity2 = /** @type {(inputs: Auth_Checkemail_Progress_Linkvalidity2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Platnost odkazu`)
};

/**
* | output |
* | --- |
* | "Link validity" |
*
* @param {Auth_Checkemail_Progress_Linkvalidity2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_progress_linkvalidity2 = /** @type {((inputs?: Auth_Checkemail_Progress_Linkvalidity2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Progress_Linkvalidity2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_progress_linkvalidity2(inputs)
	return cs_auth_checkemail_progress_linkvalidity2(inputs)
});
export { auth_checkemail_progress_linkvalidity2 as "auth.checkEmail.progress.linkValidity" }