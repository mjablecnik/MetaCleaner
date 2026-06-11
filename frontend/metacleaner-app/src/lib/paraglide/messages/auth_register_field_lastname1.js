/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Field_Lastname1Inputs */

const en_auth_register_field_lastname1 = /** @type {(inputs: Auth_Register_Field_Lastname1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Last name`)
};

const cs_auth_register_field_lastname1 = /** @type {(inputs: Auth_Register_Field_Lastname1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Příjmení`)
};

/**
* | output |
* | --- |
* | "Last name" |
*
* @param {Auth_Register_Field_Lastname1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_lastname1 = /** @type {((inputs?: Auth_Register_Field_Lastname1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Lastname1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_field_lastname1(inputs)
	return cs_auth_register_field_lastname1(inputs)
});
export { auth_register_field_lastname1 as "auth.register.field.lastName" }