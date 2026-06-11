/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Field_Emailplaceholder1Inputs */

const en_auth_common_field_emailplaceholder1 = /** @type {(inputs: Auth_Common_Field_Emailplaceholder1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`you@email.com`)
};

const cs_auth_common_field_emailplaceholder1 = /** @type {(inputs: Auth_Common_Field_Emailplaceholder1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`vas@email.cz`)
};

/**
* | output |
* | --- |
* | "you@email.com" |
*
* @param {Auth_Common_Field_Emailplaceholder1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_field_emailplaceholder1 = /** @type {((inputs?: Auth_Common_Field_Emailplaceholder1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Field_Emailplaceholder1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_field_emailplaceholder1(inputs)
	return cs_auth_common_field_emailplaceholder1(inputs)
});
export { auth_common_field_emailplaceholder1 as "auth.common.field.emailPlaceholder" }