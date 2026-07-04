import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { Difficulty } from './index';

export type RootStackParamList = {
  MainTabs: undefined;
  Game: {
    difficulty: Difficulty;
    isDaily: boolean;
    puzzleId: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Play: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type GameScreenProps = NativeStackScreenProps<RootStackParamList, 'Game'>;
export type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'> & NativeStackScreenProps<RootStackParamList, 'MainTabs'>;
export type PlayScreenProps = BottomTabScreenProps<MainTabParamList, 'Play'> & NativeStackScreenProps<RootStackParamList, 'MainTabs'>;
export type ProgressScreenProps = BottomTabScreenProps<MainTabParamList, 'Progress'>;
export type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, 'Profile'>;
