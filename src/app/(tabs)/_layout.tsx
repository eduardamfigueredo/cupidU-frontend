import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

function icone(ativo: IconName, inativo: IconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons
      name={focused ? ativo : inativo}
      size={26}
      color={color as string}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E91E63",
        tabBarInactiveTintColor: "#8A7F83",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: "#0D0709",
          borderTopColor: "#1E1519",
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Início",
          tabBarIcon: icone("flame", "flame-outline"),
        }}
      />
      <Tabs.Screen
        name="curtidas"
        options={{
          title: "Curtidas",
          tabBarIcon: icone("heart", "heart-outline"),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: icone("chatbubbles", "chatbubbles-outline"),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: icone("person", "person-outline"),
        }}
      />
    </Tabs>
  );
}
