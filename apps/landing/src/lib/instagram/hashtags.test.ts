import assert from "node:assert/strict";
import { test } from "node:test";

import { hasHashtag, postsWithHashtag, type InstagramPost } from "./hashtags";

test("hasHashtag matches the whole tag, any case", () => {
  assert.equal(hasHashtag("Welcome! #Signed #DTMOnes", "signed"), true);
  assert.equal(hasHashtag("New deal.\n#signed", "#SIGNED"), true);
  assert.equal(hasHashtag("#signedplayer of the week", "signed"), false);
  assert.equal(hasHashtag("signed without hash", "signed"), false);
  assert.equal(hasHashtag("Final MVP #RomeaoFerguson 🏆", "RomeaoFerguson"), true);
  assert.equal(hasHashtag("#RomeaoFergusonJr", "RomeaoFerguson"), false);
  assert.equal(hasHashtag("anything", ""), false);
});

test("postsWithHashtag keeps feed order and the limit", () => {
  const post = (id: string, caption: string): InstagramPost => ({
    id,
    caption,
    image: `https://cdn.example/${id}.jpg`,
    permalink: `https://instagram.com/p/${id}`,
  });
  const feed = [
    post("1", "#signed one"),
    post("2", "no tag"),
    post("3", "#signed two"),
    post("4", "#signed three"),
  ];

  assert.deepEqual(
    postsWithHashtag(feed, "signed", 2).map((p) => p.id),
    ["1", "3"],
  );

  feed[1] = post("2", "#DTMSigned");
  assert.deepEqual(
    postsWithHashtag(feed, ["dtmsigned", "signed"], 3).map((p) => p.id),
    ["1", "2", "3"],
  );
});
