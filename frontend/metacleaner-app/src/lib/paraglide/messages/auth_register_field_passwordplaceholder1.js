/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Field_Passwordplaceholder1Inputs */

const en_auth_register_field_passwordplaceholder1 = /** @type {(inputs: Auth_Register_Field_Passwordplaceholder1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Min. 8 characters`)
};

const cs_auth_register_field_passwordplaceholder1 = /** @type {(inputs: Auth_Register_Field_Passwordplaceholder1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Min. 8 znaků`)
};

/**
* | output |
* | --- |
* | "Min. 8 characters" |
*
* @param {Auth_Register_Field_Passwordplaceholder1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_passwordplaceholder1 = /** @type {((inputs?: Auth_Register_Field_Passwordplaceholder1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Passwordplaceholder1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_field_passwordplaceholder1(inputs)
	return cs_auth_register_field_passwordplaceholder1(inputs)
});
export { auth_register_field_passwordplaceholder1 as "auth.register.field.passwordPlaceholder" }