import { mocha as mochaDefinition } from "./definitions";
import { toSandpack, toShiki } from "./utils";

export const sandpackMocha = toSandpack(mochaDefinition);
export const shikiMocha = toShiki(mochaDefinition, "catppuccin-mocha", "dark");
