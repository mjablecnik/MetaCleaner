/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Submit_IdleInputs */

const en_auth_register_submit_idle = /** @type {(inputs: Auth_Register_Submit_IdleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create free account`)
};

const cs_auth_register_submit_idle = /** @type {(inputs: Auth_Register_Submit_IdleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vytvořit účet zdarma`)
};

/**
* | output |
* | --- |
* | "Create free account" |
*
* @param {Auth_Register_Submit_IdleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_submit_idle = /** @type {((inputs?: Auth_Register_Submit_IdleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Submit_IdleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_submit_idle(inputs)
	return cs_auth_register_submit_idle(inputs)
});
export { auth_register_submit_idle as "auth.register.submit.idle" }