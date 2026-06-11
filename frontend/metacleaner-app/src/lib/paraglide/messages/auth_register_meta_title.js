/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Meta_TitleInputs */

const en_auth_register_meta_title = /** @type {(inputs: Auth_Register_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Account – MetaCleaner`)
};

const cs_auth_register_meta_title = /** @type {(inputs: Auth_Register_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vytvořit účet – MetaCleaner`)
};

/**
* | output |
* | --- |
* | "Create Account – MetaCleaner" |
*
* @param {Auth_Register_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_meta_title = /** @type {((inputs?: Auth_Register_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_meta_title(inputs)
	return cs_auth_register_meta_title(inputs)
});
export { auth_register_meta_title as "auth.register.meta.title" }