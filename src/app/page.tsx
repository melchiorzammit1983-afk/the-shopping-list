"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthScreen } from "@/components/AuthScreen";
import { LocationsList } from "@/components/LocationsList";
import { LocationDetail } from "@/components/LocationDetail";
import { RecipesList } from "@/components/RecipesList";
import { RecipeDetail } from "@/components/RecipeDetail";
import { RecipeForm } from "@/components/RecipeForm";
import type { Location } from "@/types/location";
import type { Recipe } from "@/types/recipe";

type View =
  | { kind: "locations" }
  | { kind: "location-detail"; location: Location }
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
        <LocationDetail
          location={view.location}
          onBack={() => setView({ kind: "locations" })}
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
