/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Field_Confirmpasswordlabel2Inputs */

const en_auth_common_field_confirmpasswordlabel2 = /** @type {(inputs: Auth_Common_Field_Confirmpasswordlabel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm password`)
};

const cs_auth_common_field_confirmpasswordlabel2 = /** @type {(inputs: Auth_Common_Field_Confirmpasswordlabel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Potvrdit heslo`)
};

/**
* | output |
* | --- |
* | "Confirm password" |
*
* @param {Auth_Common_Field_Confirmpasswordlabel2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_field_confirmpasswordlabel2 = /** @type {((inputs?: Auth_Common_Field_Confirmpasswordlabel2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Field_Confirmpasswordlabel2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_field_confirmpasswordlabel2(inputs)
	return cs_auth_common_field_confirmpasswordlabel2(inputs)
});
export { auth_common_field_confirmpasswordlabel2 as "auth.common.field.confirmPasswordLabel" }