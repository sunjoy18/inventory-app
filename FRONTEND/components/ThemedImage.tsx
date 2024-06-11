import React from 'react';
import { Image, StyleSheet } from 'react-native';

export type ThemedImageProps = {
  source: { uri: string };
  style?: any;
};

export function ThemedImage({ source, style }: ThemedImageProps) {
  return <Image source={source} style={[styles.image, style]} onError={(e) => console.error(e.nativeEvent.error)}/>;
}

const styles = StyleSheet.create({
  image: {
    width: 50,
    aspectRatio: 1/1,
    borderRadius: 5,
  },
});
