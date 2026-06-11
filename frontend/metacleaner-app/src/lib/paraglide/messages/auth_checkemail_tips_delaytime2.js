/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Tips_Delaytime2Inputs */

const en_auth_checkemail_tips_delaytime2 = /** @type {(inputs: Auth_Checkemail_Tips_Delaytime2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`2–3 minutes`)
};

const cs_auth_checkemail_tips_delaytime2 = /** @type {(inputs: Auth_Checkemail_Tips_Delaytime2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`2–3 minuty`)
};

/**
* | output |
* | --- |
* | "2–3 minutes" |
*
* @param {Auth_Checkemail_Tips_Delaytime2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_delaytime2 = /** @type {((inputs?: Auth_Checkemail_Tips_Delaytime2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Delaytime2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_tips_delaytime2(inputs)
	return cs_auth_checkemail_tips_delaytime2(inputs)
});
export { auth_checkemail_tips_delaytime2 as "auth.checkEmail.tips.delayTime" }