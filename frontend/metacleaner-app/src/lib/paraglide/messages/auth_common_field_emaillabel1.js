/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Field_Emaillabel1Inputs */

const en_auth_common_field_emaillabel1 = /** @type {(inputs: Auth_Common_Field_Emaillabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email address`)
};

const cs_auth_common_field_emaillabel1 = /** @type {(inputs: Auth_Common_Field_Emaillabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`E-mailová adresa`)
};

/**
* | output |
* | --- |
* | "Email address" |
*
* @param {Auth_Common_Field_Emaillabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_field_emaillabel1 = /** @type {((inputs?: Auth_Common_Field_Emaillabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Field_Emaillabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_field_emaillabel1(inputs)
	return cs_auth_common_field_emaillabel1(inputs)
});
export { auth_common_field_emaillabel1 as "auth.common.field.emailLabel" }