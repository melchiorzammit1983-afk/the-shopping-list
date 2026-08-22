"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthScreen } from "@/components/AuthScreen";
import { LocationsList } from "@/components/LocationsList";
import { RoomsList } from "@/components/RoomsList";
import { RoomDetail } from "@/components/RoomDetail";
import { ShelfDetail } from "@/components/ShelfDetail";
import { ItemTotalView } from "@/components/ItemTotalView";
import { RecipesList } from "@/components/RecipesList";
import { RecipeDetail } from "@/components/RecipeDetail";
import { RecipeForm } from "@/components/RecipeForm";
import type { Location } from "@/types/location";
import type { Room } from "@/types/room";
import type { Shelf } from "@/types/shelf";
import type { Item } from "@/types/item";
import type { Recipe } from "@/types/recipe";

type View =
  | { kind: "locations" }
  | { kind: "location-detail"; location: Location }
  | { kind: "room-detail"; location: Location; room: Room }
  | { kind: "shelf-detail"; location: Location; room: Room; shelf: Shelf }
  | {
      kind: "item-total";
      location: Location;
      room: Room;
      shelf: Shelf;
      item: Item;
    }
  | { kind: "recipes" }
  | { kind: "recipe-detail"; recipe: Recipe }
  | { kind: "recipe-form"; recipe: Recipe | null };

export default function Home() {
  const { user, loaded, signUpWithPassword, signInWithPassword, signOut } =
    useAuth();
  const [view, setView] = useState<View>({ kind: "locations" });

  if (!loaded) return null;
  if (!user) {
    return (
      <AuthScreen
        signUpWithPassword={signUpWithPassword}
        signInWithPassword={signInWithPassword}
      />
    );
  }

  switch (view.kind) {
    case "location-detail":
      return (
        <RoomsList
          location={view.location}
          onBack={() => setView({ kind: "locations" })}
          onSelectRoom={(room) =>
            setView({ kind: "room-detail", location: view.location, room })
          }
        />
      );
    case "room-detail":
      return (
        <RoomDetail
          room={view.room}
          onBack={() =>
            setView({ kind: "location-detail", location: view.location })
          }
          onSelectShelf={(shelf) =>
            setView({
              kind: "shelf-detail",
              location: view.location,
              room: view.room,
              shelf,
            })
          }
        />
      );
    case "shelf-detail":
      return (
        <ShelfDetail
          shelf={view.shelf}
          userId={user.id}
          onBack={() =>
            setView({
              kind: "room-detail",
              location: view.location,
              room: view.room,
            })
          }
          onSelectItem={(item) =>
            setView({
              kind: "item-total",
              location: view.location,
              room: view.room,
              shelf: view.shelf,
              item,
            })
          }
        />
      );
    case "item-total":
      return (
        <ItemTotalView
          item={view.item}
          onBack={() =>
            setView({
              kind: "shelf-detail",
              location: view.location,
              room: view.room,
              shelf: view.shelf,
            })
          }
        />
      );
    case "recipes":
      return (
        <RecipesList
          userId={user.id}
          onSelectRecipe={(recipe) => setView({ kind: "recipe-detail", recipe })}
          onCreateRecipe={() => setView({ kind: "recipe-form", recipe: null })}
          onGoToLocations={() => setView({ kind: "locations" })}
        />
      );
    case "recipe-detail":
      return (
        <RecipeDetail
          recipe={view.recipe}
          userId={user.id}
          onBack={() => setView({ kind: "recipes" })}
          onEdit={(recipe) => setView({ kind: "recipe-form", recipe })}
        />
      );
    case "recipe-form":
      return (
        <RecipeForm
          userId={user.id}
          existingRecipe={view.recipe}
          onBack={() => setView({ kind: "recipes" })}
          onDone={(recipe) => setView({ kind: "recipe-detail", recipe })}
        />
      );
    default:
      return (
        <LocationsList
          userId={user.id}
          userEmail={user.email}
          onLogOut={signOut}
          onSelectLocation={(location) =>
            setView({ kind: "location-detail", location })
          }
          onGoToRecipes={() => setView({ kind: "recipes" })}
        />
      );
  }
}
