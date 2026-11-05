import { useEffect, useState } from "react";
import { Profile } from "../data/mockProfiles";
import {
    fetchFeedProfiles,
    registerInteraction,
} from "../services/userService";

export default function FeedScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchFeedProfiles().then((data: Profile[]) => setProfiles(data));
  }, []);

  const onSwipeComplete = (direction: "right" | "left") => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      const action = direction === "right" ? "LIKE" : "DISLIKE";
      registerInteraction(currentProfile.id, action);
    }

    setCurrentIndex((prev) => prev + 1);
  };

  // ... Restante do render (Seus cartões, gestos PanResponder e botões)
}
