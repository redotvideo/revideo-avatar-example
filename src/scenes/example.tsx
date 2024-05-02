import {Audio, Img, Rect, Video, Txt, makeScene2D, View2D} from '@revideo/2d';
import {all, chain, createRef, useScene, waitFor, createSignal} from '@revideo/core';

interface Word {
  punctuated_word: string;
  start: number;
  end: number;
}

export default makeScene2D(function* (view) {
  const avatarRef = createRef<Video>();
  const backgroundRef = createRef<Img>();
  const words: Word[] = useScene().variables.get("words", [])();

  yield view.add(
    <>
      <Rect
        fill={'white'}
        size={['100%', '100%']}
        ref={backgroundRef}
      />
      <Audio
        src={'https://revideo-example-assets.s3.amazonaws.com/chill-beat-2.mp3'}
        play={true}
        volume={0.1}
      />
      <Video
        src={'/avatar_headline.mp4'}
        play={true}
        width={'100%'}
        ref={avatarRef}
      />
    </>,
  );

  avatarRef().position.y(useScene().getSize().y / 2 - avatarRef().height() / 2);

  const logoRef = createRef<Img>();
  view.add(
    <Img
      width={'1%'}
      src={useScene().variables.get("logo", "none")()}
      ref={logoRef}
      position={[0, -useScene().getSize().y/4]}
    />
  );

  yield* all(
    chain(
      all(
        logoRef().rotation(360, 2),
        logoRef().scale(35,2),
        waitFor(avatarRef().getDuration()*2/3)
        ),
      all(
        logoRef().position.x(250, 2),
        avatarRef().width("35%", 2),
        avatarRef().radius(500, 2),
        avatarRef().position.x(-250, 2),
        avatarRef().position.y(logoRef().position.y, 2),
        backgroundRef().fill('#c4a6a1', 2),
        waitFor(avatarRef().getDuration()*1/3)
      )
    ),
    displayWords(view, words)
  );

});


function* displayWords(view: View2D, words: Word[]){
  let waitBefore = words[0].start;

  for (let i = 0; i < words.length; i++) {
    const currentClip = words[i];
    const nextClipStart =
      i < words.length - 1 ? words[i + 1].start : null;
    const isLastClip = i === words.length - 1;
    const waitAfter = isLastClip ? 1 : 0;
    const textRef = createRef<Txt>();
    yield* waitFor(waitBefore);
    view.add(
      <Txt
        fontSize={100}
        fontWeight={800}
        ref={textRef}
        fontFamily={"Arial"}
        textWrap={true}
        textAlign={"center"}
        fill={"white"}
        width={"70%"}
        lineWidth={6}
        shadowBlur={10}
        shadowColor={"black"}
        zIndex={1}
        y={500}
      >
        {currentClip.punctuated_word}
      </Txt>,
    );
    yield* waitFor(currentClip.end - currentClip.start + waitAfter);

    textRef().remove();
    waitBefore = nextClipStart !== null ? nextClipStart - currentClip.end : 0;
  }
}
