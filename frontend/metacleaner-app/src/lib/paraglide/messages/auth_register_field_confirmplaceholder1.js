/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Field_Confirmplaceholder1Inputs */

const en_auth_register_field_confirmplaceholder1 = /** @type {(inputs: Auth_Register_Field_Confirmplaceholder1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Repeat password`)
};

const cs_auth_register_field_confirmplaceholder1 = /** @type {(inputs: Auth_Register_Field_Confirmplaceholder1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zopakujte heslo`)
};

/**
* | output |
* | --- |
* | "Repeat password" |
*
* @param {Auth_Register_Field_Confirmplaceholder1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_confirmplaceholder1 = /** @type {((inputs?: Auth_Register_Field_Confirmplaceholder1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Confirmplaceholder1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_field_confirmplaceholder1(inputs)
	return cs_auth_register_field_confirmplaceholder1(inputs)
});
export { auth_register_field_confirmplaceholder1 as "auth.register.field.confirmPlaceholder" }