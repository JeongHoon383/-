import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
  id: string;
  photo: string;
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
}
// 사용 할 데이터 타입 설정

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

export default function Timeline() {
  const [tweets, setTweet] = useState<ITweet[]>([]); // map으로 데이터를 받기 때문에 초기값을 빈배열로 설정

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    // unsubscribe 변수를 선언하고 초기값을 null로 설정
    const fetchTweets = async () => {
      const tweetsQuery = query(
        // 어떤 쿼리를 가져올 것인지, 쿼리 생성
        collection(db, "hoon"),
        orderBy("createdAt", "desc"),
        // createdAT을 기준으로 내림차순 정렬
        limit(25)
        // 25개 트윗만 가져올 수 있도록
      );
      // const snapshot = await getDocs(tweetsQuery); // 문서 가져오기
      // const tweets = snapshot.docs.map((doc) => {
      //   const { tweet, createdAt, userId, username, photo } = doc.data();
      //   // 데이터 추출
      //   return {
      //     tweet,
      //     createdAt,
      //     userId,
      //     username,
      //     photo,
      //     id: doc.id,
      //   };
      // });
      // onSnapShot : 이벤트 리스너를 연결, 이벤트 -> 쿼리가 실행
      // Firestore의 데이터가 변경될 때마다 자동으로 쿼리가 다시 실행
      // 최신 데이터를 가져옴
      unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
        // unsubscribe 변수에 구독 취소 함수를 저장 why? 매번 사용 x
        const tweets = snapshot.docs.map((doc) => {
          const { tweet, createdAt, userId, username, photo } = doc.data();
          // 데이터 추출
          return {
            tweet,
            createdAt,
            userId,
            username,
            photo,
            id: doc.id,
          };
        });
        setTweet(tweets);
      });
    };
    fetchTweets();
    return () => {
      unsubscribe && unsubscribe();
      // useEffect의 cleanup 기능
      // 유저가 다른 페이지로 이동할 때(언마운트 될 때)
      // 이벤트를 종료
    };
  }, []);

  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
}
