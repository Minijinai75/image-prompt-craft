(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function textOf(el) {
    var pre = el.querySelector("pre");
    return (pre ? pre.textContent : el.textContent).replace(/\n$/, "");
  }

  function copyText(text, btn) {
    var done = function () {
      if (!btn) return;
      var old = btn.textContent;
      btn.classList.add("copied");
      btn.textContent = "已縫進剪貼簿";
      window.setTimeout(function () {
        btn.classList.remove("copied");
        btn.textContent = old;
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (err) {}
    document.body.removeChild(ta);
  }

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-copy]");
    if (!btn) return;
    var target = btn.getAttribute("data-copy");
    var box = target ? document.querySelector(target) : btn.closest(".prompt-box");
    if (!box) return;
    copyText(textOf(box), btn);
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  var layers = {
    task: {
      title: "任務類型",
      blurb: "先講清楚這一輪在做什麼。Edit 跟 Generate 是兩種完全不同的指令。想留住原圖的人，就明講 Edit，不要說「生一張很像的」。",
      weakLabel: "弱：聽起來像重畫",
      strongLabel: "強：這一輪的任務鎖死",
      weak: "Generate a similar portrait.",
      strong: "Edit the provided image while preserving the original subject identity."
    },
    invariants: {
      title: "不能變的東西",
      blurb: "人物圖要先鎖 invariant。不要只寫 keep the face——把五官幾何拆開，並補上模型最常犯的錯。",
      weakLabel: "弱：太模糊",
      strongLabel: "強：具體鎖身份",
      weak: "Make them look similar to the reference.",
      strong: "Preserve the subject's identity exactly.\nKeep the original facial structure, eye shape, nose, lips, jawline, face proportions, hairstyle, and recognizable features unchanged."
    },
    change: {
      title: "這一輪唯一要改的",
      blurb: "關鍵字是 only、everything else remains unchanged、do not alter。一次只動一件事， spillover 會少很多。",
      weakLabel: "弱：沒說「只改這個」",
      strongLabel: "強：只改衣服",
      weak: "Change the clothes and make the photo nicer.",
      strong: "Change only the clothing to a white wedding dress.\nEverything else should remain unchanged."
    },
    concrete: {
      title: "想要的結果，不要空形容詞",
      blurb: "natural / handsome / beautiful 常常讓模型重畫五官。改寫成皮膚、光、姿勢這些可檢查的東西。",
      weakLabel: "弱：抽象形容詞",
      strongLabel: "強：看得到的結果",
      weak: "Make it natural.\nMake him handsome.",
      strong: "Use soft natural skin texture, realistic pores, subtle facial shadows, physically plausible lighting, restrained skin smoothing, and realistic eye reflections.\n\nKeep his original facial features unchanged; improve only grooming, lighting, posture, and photographic presentation."
    },
    photo: {
      title: "攝影語言",
      blurb: "要真人感，用鏡頭與光線說話，不要堆「超寫實」。規格也不要塞太滿，一句就夠。",
      weakLabel: "弱：形容詞堆疊",
      strongLabel: "強：鏡頭 + 光就夠",
      weak: "beautiful stunning gorgeous cinematic epic amazing masterpiece ultra detailed 8k realistic",
      strong: "85mm portrait, soft window light, shallow depth of field"
    },
    style: {
      title: "風格最後才出場",
      blurb: "一開頭就 cinematic / dreamy / masterpiece，模型會自由發揮。人物比風格重要時，風格排在最後。",
      weakLabel: "弱：風格搶第一",
      strongLabel: "強：正確出場順序",
      weak: "cinematic, dreamy, masterpiece, award-winning, beautiful...",
      strong: "1. Edit instruction\n2. Identity preservation\n3. What changes\n4. What must stay unchanged\n5. Composition\n6. Lighting\n7. Materials / texture\n8. Style"
    }
  };

  function renderLayer(key) {
    var data = layers[key];
    if (!data) return;
    document.getElementById("layer-title").textContent = data.title;
    document.getElementById("layer-blurb").textContent = data.blurb;
    document.getElementById("weak-label").textContent = data.weakLabel;
    document.getElementById("strong-label").textContent = data.strongLabel;
    document.getElementById("weak-prompt").textContent = data.weak;
    document.getElementById("strong-prompt").textContent = data.strong;
    document.querySelectorAll(".layer-dock button").forEach(function (btn) {
      btn.setAttribute("aria-selected", btn.getAttribute("data-layer") === key ? "true" : "false");
    });
  }

  document.querySelectorAll(".layer-dock button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      renderLayer(btn.getAttribute("data-layer"));
    });
  });
  renderLayer("task");

  var clinic = {
    identity: {
      name: "Identity Drift",
      symptoms: "五官跑掉、人突然變漂亮或變年輕、眼睛形狀變了、臉型改了。",
      fix: "Restore the original facial identity from the reference image.\nDo not reinterpret or beautify the face.\nMatch the original facial geometry and proportions."
    },
    spillover: {
      name: "Edit Spillover",
      symptoms: "本來只叫它改衣服，結果背景、臉、姿勢也一起改。",
      fix: "Modify ONLY the clothing.\nAll unmentioned image regions must remain unchanged.\n\nTreat all non-clothing pixels as protected content."
    },
    style: {
      name: "Over-stylization",
      symptoms: "太像 AI、皮膚太滑、眼睛太亮、打光過度、像遊戲 CG。",
      fix: "Reduce stylization.\nUse documentary-style photographic realism.\nPreserve natural skin imperfections and micro-texture.\nAvoid beauty-filter skin, CGI smoothness, exaggerated catchlights, and artificial glow."
    },
    composition: {
      name: "Composition Drift",
      symptoms: "人位置跑掉、原本半身變全身、相機角度變了。",
      fix: "Match the original composition exactly.\nKeep the same camera position, crop, body placement, head size, perspective, and framing."
    },
    lighting: {
      name: "Lighting Mismatch",
      symptoms: "換進去的人看起來像貼上去。",
      fix: "Match the inserted subject to the original scene's:\n- light direction\n- light intensity\n- color temperature\n- shadow softness\n- contrast\n- exposure\n- depth of field\n\nThe result must look like both subjects were photographed together in the same shot."
    }
  };

  function renderClinic(key) {
    var data = clinic[key];
    if (!data) return;
    document.getElementById("clinic-name").textContent = data.name;
    document.getElementById("clinic-symptoms").textContent = data.symptoms;
    document.getElementById("clinic-fix").textContent = data.fix;
    document.querySelectorAll(".clinic-tabs button").forEach(function (btn) {
      btn.setAttribute("aria-selected", btn.getAttribute("data-clinic") === key ? "true" : "false");
    });
  }

  document.querySelectorAll(".clinic-tabs button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      renderClinic(btn.getAttribute("data-clinic"));
    });
  });
  renderClinic("identity");

  var task = "edit";
  var change = "the clothing to a white wedding dress";

  var presets = {
    clothing: "the clothing to a white wedding dress",
    background: "the background",
    iris: "the iris color to natural golden amber",
    lighting: "the lighting to soft directional daylight",
    male: "the male subject using the second reference image"
  };

  function assemble() {
    var custom = document.getElementById("custom-change").value.trim();
    var x = custom || change;
    var out = "";
    if (task === "edit") {
      out =
        "Edit the provided image.\n\n" +
        "Change ONLY " + x + ".\n\n" +
        "Preserve the original subject's identity exactly.\n" +
        "Keep facial structure, eyes, nose, lips, jawline, face proportions, hairstyle, skin tone, and recognizable features unchanged.\n\n" +
        "Keep the original:\n- pose\n- facial expression\n- camera angle\n- framing\n- composition\n- lighting direction\n\n" +
        "Do not redesign the face.\nDo not beautify or reshape facial features.\nDo not change age or identity.\nDo not alter unrelated parts of the image.\n\n" +
        "Natural realistic photography.\nRealistic skin texture and pores.\nPhysically plausible lighting.\nNatural shadows and reflections.\nRealistic fabric and material texture.\n\n" +
        "Avoid plastic skin, excessive sharpening, uncanny eyes, and artificial HDR.\n\n" +
        "The result should look like the original photograph with only the requested change naturally applied.";
    } else if (task === "replace") {
      out =
        "Edit the first image.\n\n" +
        "Replace ONLY " + x + ".\n\n" +
        "Preserve the replacement subject's:\n- facial identity\n- facial proportions\n- eye shape\n- nose\n- lips\n- jawline\n- hairstyle\n- hair color\n- iris color\n\n" +
        "Adapt only:\n- pose\n- perspective\n- scale\n- lighting\n- shadows\n- color temperature\n\n" +
        "so that the subject naturally fits the first image.\n\n" +
        "Keep the other subject from the first image completely unchanged.\nDo not modify that person's face, hair, body, expression, clothing, or skin.\n\n" +
        "Preserve the original composition, camera angle, framing, background, and lighting.\n\n" +
        "The final image should look like an authentic photograph of both people together, not a face swap or collage.";
    } else {
      out =
        "Create a new image.\n\n" +
        "Subject: [concrete identity traits; if using a reference, preserve recognizable identity]\n" +
        "Composition: [framing, camera angle, pose]\n" +
        "Environment: [place and time of day]\n" +
        "Lighting: Soft directional daylight with gentle contrast and realistic skin texture.\n" +
        "Material / Texture: Realistic skin micro-texture, natural fabric folds, physically plausible shadows.\n" +
        "Style: Natural editorial portrait photography. Place style last.\n\n" +
        "Primary requested element: " + x + ".\n\n" +
        "Avoid vague adjectives such as masterpiece, stunning, gorgeous, or ultra detailed.\n" +
        "Avoid plastic skin, exaggerated eyes, glowing irises, and unnecessary stylization.";
    }
    document.getElementById("play-prompt").textContent = out;
  }

  document.querySelectorAll(".task-tabs button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      task = btn.getAttribute("data-task");
      document.querySelectorAll(".task-tabs button").forEach(function (b) {
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      assemble();
    });
  });

  document.querySelectorAll(".change-chips button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      change = presets[btn.getAttribute("data-change")];
      document.getElementById("custom-change").value = "";
      document.querySelectorAll(".change-chips button").forEach(function (b) {
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      assemble();
    });
  });

  document.getElementById("custom-change").addEventListener("input", assemble);
  assemble();
})();
