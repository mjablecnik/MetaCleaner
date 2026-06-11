/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkcode_Meta_Title1Inputs */

const en_auth_checkcode_meta_title1 = /** @type {(inputs: Auth_Checkcode_Meta_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verify Code – MetaCleaner`)
};

const cs_auth_checkcode_meta_title1 = /** @type {(inputs: Auth_Checkcode_Meta_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ověřte kód – MetaCleaner`)
};

/**
* | output |
* | --- |
* | "Verify Code – MetaCleaner" |
*
* @param {Auth_Checkcode_Meta_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_meta_title1 = /** @type {((inputs?: Auth_Checkcode_Meta_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Meta_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkcode_meta_title1(inputs)
	return cs_auth_checkcode_meta_title1(inputs)
});
export { auth_checkcode_meta_title1 as "auth.checkCode.meta.title" }