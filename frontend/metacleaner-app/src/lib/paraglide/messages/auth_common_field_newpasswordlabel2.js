/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Field_Newpasswordlabel2Inputs */

const en_auth_common_field_newpasswordlabel2 = /** @type {(inputs: Auth_Common_Field_Newpasswordlabel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New password`)
};

const cs_auth_common_field_newpasswordlabel2 = /** @type {(inputs: Auth_Common_Field_Newpasswordlabel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nové heslo`)
};

/**
* | output |
* | --- |
* | "New password" |
*
* @param {Auth_Common_Field_Newpasswordlabel2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_field_newpasswordlabel2 = /** @type {((inputs?: Auth_Common_Field_Newpasswordlabel2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Field_Newpasswordlabel2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_field_newpasswordlabel2(inputs)
	return cs_auth_common_field_newpasswordlabel2(inputs)
});
export { auth_common_field_newpasswordlabel2 as "auth.common.field.newPasswordLabel" }