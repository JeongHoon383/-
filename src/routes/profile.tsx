import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
`;
const Input = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
  text-align: center;
`;

const Button = styled.button`
  width: 100%;
`;

const Tweets = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EditWrapper = styled.div`
  width: 100%;
`;

const EditInput = styled.input``;

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
  const [newName, setNewName] = useState(user?.displayName || ""); // 새로운 이름 상태
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target; // input에 업로드한 files 가져오기
    if (!user) return;
    if (files && files.length === 1) {
      // 파일 하나만 필요
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, "hoon"),
      where("userId", "==", user?.uid),
      // 쿼리에 조건 설정, 조건에 맞게 데이터 조회
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };
  useEffect(() => {
    fetchTweets();
  }, []);

  // 이름 변경 관련 상태

  // 이름 변경 처리
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  // 이름 업데이트 로직
  const handleNameSubmit = async () => {
    if (user && newName.trim()) {
      await updateProfile(user, { displayName: newName });
      setIsEditing(false); // 수정 모드 종료
    }
  };

  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
        )}
      </AvatarUpload>
      <Input
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      <Name>
        {isEditing ? (
          <EditWrapper>
            <EditInput
              id="EditInput"
              type="text"
              value={newName}
              onChange={handleNameChange}
              placeholder="새로운 이름을 입력하세요"
            />
            <Button onClick={handleNameSubmit}>이름 저장</Button>
          </EditWrapper>
        ) : (
          <EditWrapper onClick={() => setIsEditing(true)}>
            {user?.displayName ?? "Anonymous"}
            <Button>이름 변경</Button>
          </EditWrapper>
        )}
      </Name>

      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
