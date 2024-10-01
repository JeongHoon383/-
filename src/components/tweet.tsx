import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser; // 로그인된 유저 정보 받기
  const onDelete = async () => {
    const ok = confirm("정말 삭제하실 건가요?");
    if (!ok || user?.uid !== userId) return; // confirm 취소 또는 로그인된 id와 트윗의 id가 같지 않다면 함수 종료(실행x)
    try {
      await deleteDoc(doc(db, "hoon", id)); // 매개변수는 삭제할 문서에 대한 참조
      if (photo) {
        const photoRef = ref(
          storage,
          `tweets/${user.uid}-${user.displayName}/${id}`
        );
        // 어떤 사진 삭제할건지 사진 폴더 및 파일 참조
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
    }
  };
  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{tweet}</Payload>
        {user?.uid === userId ? (
          <DeleteButton onClick={onDelete}>Delete</DeleteButton>
        ) : null}
      </Column>
      <Column>{photo ? <Photo src={photo} /> : null}</Column>
    </Wrapper>
  );
}
