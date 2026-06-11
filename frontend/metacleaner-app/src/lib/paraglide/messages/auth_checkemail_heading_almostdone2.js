/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Heading_Almostdone2Inputs */

const en_auth_checkemail_heading_almostdone2 = /** @type {(inputs: Auth_Checkemail_Heading_Almostdone2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Almost done!`)
};

const cs_auth_checkemail_heading_almostdone2 = /** @type {(inputs: Auth_Checkemail_Heading_Almostdone2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skoro hotovo!`)
};

/**
* | output |
* | --- |
* | "Almost done!" |
*
* @param {Auth_Checkemail_Heading_Almostdone2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_heading_almostdone2 = /** @type {((inputs?: Auth_Checkemail_Heading_Almostdone2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Heading_Almostdone2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_heading_almostdone2(inputs)
	return cs_auth_checkemail_heading_almostdone2(inputs)
});
export { auth_checkemail_heading_almostdone2 as "auth.checkEmail.heading.almostDone" }