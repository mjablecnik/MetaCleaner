/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Submit_LoadingInputs */

const en_auth_register_submit_loading = /** @type {(inputs: Auth_Register_Submit_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creating account...`)
};

const cs_auth_register_submit_loading = /** @type {(inputs: Auth_Register_Submit_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vytvářím účet...`)
};

/**
* | output |
* | --- |
* | "Creating account..." |
*
* @param {Auth_Register_Submit_LoadingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_submit_loading = /** @type {((inputs?: Auth_Register_Submit_LoadingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Submit_LoadingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_submit_loading(inputs)
	return cs_auth_register_submit_loading(inputs)
});
export { auth_register_submit_loading as "auth.register.submit.loading" }