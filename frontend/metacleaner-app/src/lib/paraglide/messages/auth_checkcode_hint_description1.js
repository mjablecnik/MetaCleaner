/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ email: NonNullable<unknown> }} Auth_Checkcode_Hint_Description1Inputs */

const en_auth_checkcode_hint_description1 = /** @type {(inputs: Auth_Checkcode_Hint_Description1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Code sent to ${i?.email}. Please also check your spam folder.`)
};

const cs_auth_checkcode_hint_description1 = /** @type {(inputs: Auth_Checkcode_Hint_Description1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Kód byl odeslán na ${i?.email}. Zkontrolujte také složku spam.`)
};

/**
* | output |
* | --- |
* | "Code sent to {email}. Please also check your spam folder." |
*
* @param {Auth_Checkcode_Hint_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_hint_description1 = /** @type {((inputs: Auth_Checkcode_Hint_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Hint_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkcode_hint_description1(inputs)
	return cs_auth_checkcode_hint_description1(inputs)
});
export { auth_checkcode_hint_description1 as "auth.checkCode.hint.description" }