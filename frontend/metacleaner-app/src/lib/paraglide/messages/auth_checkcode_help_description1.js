/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkcode_Help_Description1Inputs */

const en_auth_checkcode_help_description1 = /** @type {(inputs: Auth_Checkcode_Help_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We sent the code to your email. If you don't see it, check the Spam or Bulk folder.`)
};

const cs_auth_checkcode_help_description1 = /** @type {(inputs: Auth_Checkcode_Help_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Kód jsme odeslali na váš e-mail. Pokud jej nevidíte, zkontrolujte složku Spam nebo Hromadné.`)
};

/**
* | output |
* | --- |
* | "We sent the code to your email. If you don't see it, check the Spam or Bulk folder." |
*
* @param {Auth_Checkcode_Help_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_help_description1 = /** @type {((inputs?: Auth_Checkcode_Help_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Help_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkcode_help_description1(inputs)
	return cs_auth_checkcode_help_description1(inputs)
});
export { auth_checkcode_help_description1 as "auth.checkCode.help.description" }