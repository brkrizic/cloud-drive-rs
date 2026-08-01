module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind', // for NativeWind
        },
      ],
      'nativewind/babel', // NativeWind plugin
    ],
    plugins: [
      'react-native-worklets/plugin', // Reanimated 2 worklets
    ],
  };
};
