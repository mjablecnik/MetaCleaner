/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Submit_SavingInputs */

const en_auth_common_submit_saving = /** @type {(inputs: Auth_Common_Submit_SavingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saving...`)
};

const cs_auth_common_submit_saving = /** @type {(inputs: Auth_Common_Submit_SavingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ukládám...`)
};

/**
* | output |
* | --- |
* | "Saving..." |
*
* @param {Auth_Common_Submit_SavingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_submit_saving = /** @type {((inputs?: Auth_Common_Submit_SavingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Submit_SavingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_submit_saving(inputs)
	return cs_auth_common_submit_saving(inputs)
});
export { auth_common_submit_saving as "auth.common.submit.saving" }