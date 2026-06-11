/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Actions_StopInputs */

const en_step3_actions_stop = /** @type {(inputs: Step3_Actions_StopInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stop`)
};

const cs_step3_actions_stop = /** @type {(inputs: Step3_Actions_StopInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zastavit`)
};

/**
* | output |
* | --- |
* | "Stop" |
*
* @param {Step3_Actions_StopInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_actions_stop = /** @type {((inputs?: Step3_Actions_StopInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Actions_StopInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_actions_stop(inputs)
	return cs_step3_actions_stop(inputs)
});
export { step3_actions_stop as "step3.actions.stop" }