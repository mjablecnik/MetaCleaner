/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkcode_Hint_Title1Inputs */

const en_auth_checkcode_hint_title1 = /** @type {(inputs: Auth_Checkcode_Hint_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Code sent to`)
};

const cs_auth_checkcode_hint_title1 = /** @type {(inputs: Auth_Checkcode_Hint_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Kód odeslán na`)
};

/**
* | output |
* | --- |
* | "Code sent to" |
*
* @param {Auth_Checkcode_Hint_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_hint_title1 = /** @type {((inputs?: Auth_Checkcode_Hint_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Hint_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkcode_hint_title1(inputs)
	return cs_auth_checkcode_hint_title1(inputs)
});
export { auth_checkcode_hint_title1 as "auth.checkCode.hint.title" }