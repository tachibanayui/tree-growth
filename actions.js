export const TOGGLE = 't';
export const MOVE_DOWN = 'md';
export const MOVE_UP = 'mu';
export const NONE = 'none';

const defaultKeybind = [
    {key: 'w', action: MOVE_UP},
    {key: 's', action: MOVE_DOWN},
    {key: String.fromCharCode(13), action: TOGGLE}
];

export default defaultKeybind;
