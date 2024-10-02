import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useEffect, useRef, useState } from "react";

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
  cursor: pointer;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const Button = styled.button`
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  color: white;
`;

const DeleteButton = styled(Button)`
  background-color: tomato;
`;

const EditButton = styled(Button)`
  background-color: blue;
`;

const AttachFileInput = styled.input`
  display: none;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const [file, setFile] = useState<File | null>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const onEdit = async () => {
    const tweetUpdate = window.prompt("Edit your tweet", tweet);
    if (tweetUpdate) {
      try {
        const tweetDocRef = doc(db, "hoon", id);
        await updateDoc(tweetDocRef, {
          // 업데이트 할 문서를 참조
          tweet: tweetUpdate,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onUpdatePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 참조가 존재할 경우에만 input 클릭
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      const selectedFile = files[0];
      if (selectedFile.size > 1024 * 1024) {
        alert("파일 크기는 1MB 이하여야 합니다.");
        setFile(null); // 파일이 1MB보다 크면 초기화
      } else {
        setFile(selectedFile); // 파일이 1MB 이하일 때만 설정
      }
    }
  };

  useEffect(() => {
    const uploadPhoto = async () => {
      if (file) {
        try {
          const tweetDocRef = doc(db, "hoon", id);
          const locationRef = ref(
            storage,
            `tweets/${user?.uid}-${user?.displayName}/${id}`
          );

          // Firestore에서 기존의 트윗 데이터를 가져오기
          const tweetDocSnap = await getDoc(tweetDocRef);
          const existingPhotoUrl = tweetDocSnap.data()?.photo;

          // 기존 사진이 있을 경우 Firebase Storage에서 삭제
          if (existingPhotoUrl) {
            const oldPhotoRef = ref(storage, existingPhotoUrl);
            await deleteObject(oldPhotoRef);
          }

          // 새 파일을 Firebase Storage에 업로드
          const result = await uploadBytes(locationRef, file);
          const url = await getDownloadURL(result.ref);

          // Firestore에서 새 사진 URL로 업데이트
          await updateDoc(tweetDocRef, {
            photo: url,
          });

          console.log("Photo updated successfully");
        } catch (error) {
          console.error("Error updating photo:", error);
        } finally {
          setFile(null); // 파일 업로드 후 초기화
        }
      }
    };

    uploadPhoto(); // useEffect에서 사진 업로드 함수 호출
  }, [file]); // file 상태가 변경될 때마다 실행

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{tweet}</Payload>
        {user?.uid === userId ? (
          <DeleteButton onClick={onDelete}>Delete</DeleteButton>
        ) : null}
        {user?.uid === userId ? (
          <EditButton onClick={onEdit}>Edit</EditButton>
        ) : null}
      </Column>
      <Column>
        {photo ? (
          <Photo src={photo} alt="Uploaded" onClick={onUpdatePhoto} />
        ) : null}
        <AttachFileInput
          onChange={onFileChange}
          type="file"
          id="file"
          accept="image/*"
          ref={fileInputRef}
        />
      </Column>
    </Wrapper>
  );
}
