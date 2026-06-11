/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Field_Lastnameplaceholder2Inputs */

const en_auth_register_field_lastnameplaceholder2 = /** @type {(inputs: Auth_Register_Field_Lastnameplaceholder2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Doe`)
};

const cs_auth_register_field_lastnameplaceholder2 = /** @type {(inputs: Auth_Register_Field_Lastnameplaceholder2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Novák`)
};

/**
* | output |
* | --- |
* | "Doe" |
*
* @param {Auth_Register_Field_Lastnameplaceholder2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_lastnameplaceholder2 = /** @type {((inputs?: Auth_Register_Field_Lastnameplaceholder2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Lastnameplaceholder2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_field_lastnameplaceholder2(inputs)
	return cs_auth_register_field_lastnameplaceholder2(inputs)
});
export { auth_register_field_lastnameplaceholder2 as "auth.register.field.lastNamePlaceholder" }