/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Tips_Checkfolder2Inputs */

const en_auth_checkemail_tips_checkfolder2 = /** @type {(inputs: Auth_Checkemail_Tips_Checkfolder2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Check the`)
};

const cs_auth_checkemail_tips_checkfolder2 = /** @type {(inputs: Auth_Checkemail_Tips_Checkfolder2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zkontrolujte složku`)
};

/**
* | output |
* | --- |
* | "Check the" |
*
* @param {Auth_Checkemail_Tips_Checkfolder2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_checkfolder2 = /** @type {((inputs?: Auth_Checkemail_Tips_Checkfolder2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Checkfolder2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_tips_checkfolder2(inputs)
	return cs_auth_checkemail_tips_checkfolder2(inputs)
});
export { auth_checkemail_tips_checkfolder2 as "auth.checkEmail.tips.checkFolder" }