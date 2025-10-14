import { latte as latteDefinition } from "./definitions";
import { toSandpack, toShiki } from "./utils";

export const sandpackLatte = toSandpack(latteDefinition);
export const shikiLatte = toShiki(latteDefinition, "catppuccin-latte", "light");
