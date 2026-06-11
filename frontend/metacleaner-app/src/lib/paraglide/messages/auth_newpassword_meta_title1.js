/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Newpassword_Meta_Title1Inputs */

const en_auth_newpassword_meta_title1 = /** @type {(inputs: Auth_Newpassword_Meta_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New Password – MetaCleaner`)
};

const cs_auth_newpassword_meta_title1 = /** @type {(inputs: Auth_Newpassword_Meta_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nové heslo – MetaCleaner`)
};

/**
* | output |
* | --- |
* | "New Password – MetaCleaner" |
*
* @param {Auth_Newpassword_Meta_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_meta_title1 = /** @type {((inputs?: Auth_Newpassword_Meta_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Meta_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_newpassword_meta_title1(inputs)
	return cs_auth_newpassword_meta_title1(inputs)
});
export { auth_newpassword_meta_title1 as "auth.newPassword.meta.title" }